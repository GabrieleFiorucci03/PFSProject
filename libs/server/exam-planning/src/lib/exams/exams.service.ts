import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { ExamEntity } from './exam.entity';
import { ExamsRepository, CreateExamPayload, UpdateExamPayload } from './exams.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { ExamSessionsRepository } from '../exam-sessions/exam-sessions.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { SubjectEntity } from '../subjects/subject.entity';
import { ExamSessionEntity } from '../exam-sessions/exam-sessions.entity';
import { TeacherEntity } from '../teachers/teacher.entity';
import { handleDatabaseError } from '../database-error.helper';
import { ExamListItem } from './interfaces/exam-list-item.interface';

@Injectable()
export class ExamsService {
    constructor(
        private readonly repository: ExamsRepository,
        private readonly subjectsRepository: SubjectsRepository,
        private readonly examSessionsRepository: ExamSessionsRepository,
        private readonly teachersRepository: TeachersRepository,
    ) {}

    // FK annidate {id, name}; date come stringa ISO (YYYY-MM-DD).
    private toListItem(exam: ExamEntity): ExamListItem {
        return {
            id: exam.examId,
            date: this.toIso(exam.date),
            startHour: exam.startHour,
            endHour: exam.endHour,
            roomType: exam.roomType,
            type: exam.type,
            subject: {
                id: exam.subject.subjectId,
                name: exam.subject.name,
            },
            examSession: {
                id: exam.examSession.examSessionId,
                name: exam.examSession.name,
            },
            teacher: {
                id: exam.teacher.teacherId,
                name: exam.teacher.user.name,
            },
        };
    }

    private async getEntityById(examId: number): Promise<ExamEntity> {
        const exam = await this.repository.findById(examId);
        if (!exam) {
            throw new NotFoundException(`Esame con id ${examId} non trovato`);
        }
        return exam;
    }

    async findAll(): Promise<ExamListItem[]> {
        const exams = await this.repository.findAll();
        return exams.map((exam) => this.toListItem(exam));
    }

    async findById(examId: number): Promise<ExamListItem> {
        return this.toListItem(await this.getEntityById(examId));
    }

    async findOwnExams(currentUser: AuthenticatedUser): Promise<ExamListItem[]> {
        const teacher = await this.teachersRepository.findByUserId(currentUser.id);
        if (!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        const exams = await this.repository.findByTeacher(teacher.teacherId);
        return exams.map((exam) => this.toListItem(exam));
    }

    async findByTeacher(teacherId: number): Promise<ExamListItem[]> {
        const teacher = await this.teachersRepository.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException(`Docente con id ${teacherId} non trovato`);
        }
        const exams = await this.repository.findByTeacher(teacherId);
        return exams.map((exam) => this.toListItem(exam));
    }

    async createOne(dto: CreateExamDto, currentUser: AuthenticatedUser): Promise<ExamListItem> {
        const subject = await this.resolveSubject(dto.subjectId);
        const examSession = await this.resolveExamSession(dto.examSessionId);
        const teacher = await this.resolveOwnTeacher(currentUser);

        if (subject.teacher.teacherId !== teacher.teacherId) {
            throw new ForbiddenException('Puoi creare esami solo per le tue materie');
        }

        await this.validateExam({
            date: dto.date,
            startHour: dto.startHour,
            endHour: dto.endHour,
            subject,
            examSession,
            currentUser,
        });

        const payload: CreateExamPayload = {
            date: new Date(dto.date),
            startHour: dto.startHour,
            endHour: dto.endHour,
            roomType: dto.roomType,
            type: dto.type,
            subject,
            examSession,
            teacher,
        };

        try {
            return this.toListItem(await this.repository.createOne(payload));
        } catch (error) {
            handleDatabaseError(error, "Errore durante la creazione dell'esame");
        }
    }

    async updateOne(
        examId: number,
        dto: UpdateExamDto,
        currentUser: AuthenticatedUser,
    ): Promise<ExamListItem> {
        const existing = await this.getEntityById(examId);

        if (currentUser.role === UserRole.DOCENTE && existing.teacher.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi modificare solo i tuoi esami');
        }

        const subject = dto.subjectId !== undefined
            ? await this.resolveSubject(dto.subjectId)
            : existing.subject;

        const examSession = dto.examSessionId !== undefined
            ? await this.resolveExamSession(dto.examSessionId)
            : existing.examSession;

        if (currentUser.role === UserRole.DOCENTE && subject.teacher.user.id !== currentUser.id) {
            throw new ForbiddenException("Puoi assegnare l'esame solo a una tua materia");
        }

        await this.validateExam({
            date: dto.date ?? this.toIso(existing.date),
            startHour: dto.startHour ?? existing.startHour,
            endHour: dto.endHour ?? existing.endHour,
            subject,
            examSession,
            currentUser,
            excludeExamId: examId,
        });

        const payload: UpdateExamPayload = {};
        if (dto.date !== undefined) payload.date = new Date(dto.date);
        if (dto.startHour !== undefined) payload.startHour = dto.startHour;
        if (dto.endHour !== undefined) payload.endHour = dto.endHour;
        if (dto.roomType !== undefined) payload.roomType = dto.roomType;
        if (dto.type !== undefined) payload.type = dto.type;
        if (dto.subjectId !== undefined) payload.subject = subject;
        if (dto.examSessionId !== undefined) payload.examSession = examSession;

        try {
            const updated = await this.repository.updateOne(examId, payload);
            if (!updated) {
                throw new NotFoundException(`Esame con id ${examId} non trovato`);
            }
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento dell'esame");
        }
    }

    async deleteOne(examId: number, currentUser: AuthenticatedUser): Promise<void> {
        const exam = await this.getEntityById(examId);

        if (currentUser.role === UserRole.DOCENTE && exam.teacher.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi eliminare solo i tuoi esami');
        }

        try {
            const deleted = await this.repository.deleteOne(examId);
            if (!deleted) {
                throw new NotFoundException(`Esame con id ${examId} non trovato`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione dell'esame");
        }
    }

    // Date già occupate (ISO 'YYYY-MM-DD', senza duplicati) per un corso+anno:
    // il calendario del docente le usa per i giorni rossi da conflitto. Espone
    // solo le date, non i dettagli degli esami altrui.
    async findOccupiedDates(degreeCourseId: number, year: number): Promise<string[]> {
        const exams = await this.repository.findOccupiedDates(degreeCourseId, year);
        return [...new Set(exams.map((exam) => this.toIso(exam.date)))];
    }

    private async resolveSubject(subjectId: number): Promise<SubjectEntity> {
        const subject = await this.subjectsRepository.findById(subjectId);
        if (!subject) {
            throw new NotFoundException(`Materia con id ${subjectId} non trovata`);
        }
        return subject;
    }

    private async resolveExamSession(examSessionId: number): Promise<ExamSessionEntity> {
        const examSession = await this.examSessionsRepository.findById(examSessionId);
        if (!examSession) {
            throw new NotFoundException(`Sessione con id ${examSessionId} non trovata`);
        }
        return examSession;
    }

    private async resolveOwnTeacher(currentUser: AuthenticatedUser): Promise<TeacherEntity> {
        const teacher = await this.teachersRepository.findByUserId(currentUser.id);
        if (!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        return teacher;
    }

    private async validateExam(args: {
        date: string;
        startHour: number;
        endHour: number;
        subject: SubjectEntity;
        examSession: ExamSessionEntity;
        currentUser: AuthenticatedUser;
        excludeExamId?: number;
    }): Promise<void> {
        const { date, startHour, endHour, subject, examSession, currentUser, excludeExamId } = args;

        if (startHour >= endHour) {
            throw new BadRequestException("L'ora di inizio esame deve essere precedente all'ora di fine esame");
        }

        const sessionStart = this.toIso(examSession.startDate);
        const sessionEnd = this.toIso(examSession.endDate);
        if (date < sessionStart || date > sessionEnd) {
            throw new BadRequestException(
                `La data dell'esame deve essere compresa tra ${sessionStart} e ${sessionEnd}`,
            );
        }

        if (currentUser.role === UserRole.DOCENTE) {
            const today = this.toIso(new Date());
            const planningStart = this.toIso(examSession.planningStartDate);
            const planningEnd = this.toIso(examSession.planningEndDate);
            if (today < planningStart || today > planningEnd) {
                throw new ForbiddenException(
                    `Puoi pianificare esami solo tra ${planningStart} e ${planningEnd}`,
                );
            }
        }

        // getUTCDay: date e' 'YYYY-MM-DD' (parsata come mezzanotte UTC); getDay()
        // userebbe il fuso del server e potrebbe sfasare il giorno della settimana.
        const day = new Date(date).getUTCDay();
        if (day === 0 || day === 6) {
            throw new BadRequestException('Non è possibile pianificare un esame nel weekend');
        }

        const conflicting = await this.repository.findConflictingExam(
            subject.degreeCourse.degreeCourseId,
            subject.year,
            new Date(date),
            excludeExamId,
        );
        if (conflicting) {
            throw new ConflictException(
                `Esiste già un altro esame il ${date} per il ${subject.year}° anno del corso "${subject.degreeCourse.name}"`,
            );
        }

        const sameSubjectInSession = await this.repository.findBySubjectAndSession(
            subject.subjectId,
            examSession.examSessionId,
            excludeExamId,
        );
        if (sameSubjectInSession) {
            throw new ConflictException(
                `Esiste già un appello per "${subject.name}" nella sessione "${examSession.name}"`,
            );
        }
    }

    // Robusto sia se la colonna 'date' arriva come Date sia come stringa 'YYYY-MM-DD'.
    private toIso(date: Date | string): string {
        return typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10);
    }
}
