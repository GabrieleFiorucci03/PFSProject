import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ExamSessionsRepository } from './exam-sessions.repository';
import { ExamsRepository } from '../exams/exams.repository';
import { ExamSessionEntity } from './exam-sessions.entity';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { handleDatabaseError } from '../database-error.helper';
import { nameKey, normalizeName } from '../name-normalize.helper';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { ExamSessionListItem } from './interfaces/exam-session-list-item.interface';

@Injectable()
export class ExamSessionsService {
    constructor(
        private readonly repository: ExamSessionsRepository,
        private readonly examsRepository: ExamsRepository,
    ) {}

    // Robusto sia se la colonna 'date' arriva come Date sia come stringa 'YYYY-MM-DD'.
    private toIso(date: Date | string): string {
        return typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10);
    }

    private toListItem(session: ExamSessionEntity): ExamSessionListItem {
        return {
            id: session.examSessionId,
            name: session.name,
            startDate: this.toIso(session.startDate),
            endDate: this.toIso(session.endDate),
            planningStartDate: this.toIso(session.planningStartDate),
            planningEndDate: this.toIso(session.planningEndDate),
        };
    }

    // Il nome della sessione ha un vincolo UNIQUE sul DB: un 23505 in scrittura
    // significa sempre "nome già usato". Lo traduciamo in un messaggio chiaro;
    // ogni altro errore va all'helper generico.
    private handleWriteError(error: unknown, fallback: string): never {
        if (
            error instanceof QueryFailedError &&
            (error.driverError as { code?: string }).code === '23505'
        ) {
            throw new ConflictException('Esiste già una sessione con questo nome');
        }
        handleDatabaseError(error, fallback);
    }

    // Unicità case/spazi-insensitive del nome (il vincolo DB non vede le sole
    // differenze di maiuscole): confronto sulle chiavi normalizzate.
    private async assertNameAvailable(name: string, excludeId?: number): Promise<void> {
        const key = nameKey(name);
        const all = await this.repository.findAll();
        const clash = all.find(
            (s) => s.examSessionId !== excludeId && nameKey(s.name) === key,
        );
        if (clash) {
            throw new ConflictException('Esiste già una sessione con questo nome');
        }
    }

    // I periodi-sessione [startDate, endDate] non possono sovrapporsi tra loro:
    // così le sessioni hanno confini netti. Le finestre di pianificazione invece
    // possono sovrapporsi (non sono controllate qui). Due intervalli [a,b] e
    // [c,d] si sovrappongono se a <= d && c <= b (le date ISO si confrontano
    // direttamente come stringhe).
    private async assertNoSessionOverlap(
        startDate: string,
        endDate: string,
        excludeId?: number,
    ): Promise<void> {
        const all = await this.repository.findAll();
        const overlap = all.find((s) => {
            if (s.examSessionId === excludeId) return false;
            return startDate <= this.toIso(s.endDate) && this.toIso(s.startDate) <= endDate;
        });
        if (overlap) {
            throw new ConflictException(
                `Il periodo della sessione si sovrappone alla sessione "${overlap.name}" (${this.toIso(overlap.startDate)} → ${this.toIso(overlap.endDate)})`,
            );
        }
    }

    private async getEntityById(examSessionId: number): Promise<ExamSessionEntity> {
        const session = await this.repository.findById(examSessionId);
        if (!session) {
            throw new NotFoundException(`Sessione con examSessionId ${examSessionId} non trovata`);
        }
        return session;
    }

    private validateDates(dates: {
        startDate: string;
        endDate: string;
        planningStartDate: string;
        planningEndDate: string;
    }): void {
        if (dates.startDate >= dates.endDate) {
            throw new BadRequestException('La data di inizio sessione deve essere precedente alla data di fine sessione');
        }
        if (dates.planningStartDate >= dates.planningEndDate) {
            throw new BadRequestException('La data di inizio pianificazione deve essere precedente alla data di fine pianificazione');
        }
        if (dates.planningEndDate > dates.startDate) {
            throw new BadRequestException('La data di fine pianificazione deve essere precedente o uguale alla data di inizio sessione');
        }
    }

    async findAll(): Promise<ExamSessionListItem[]> {
        const sessions = await this.repository.findAll();
        return sessions.map((session) => this.toListItem(session));
    }

    async findById(examSessionId: number): Promise<ExamSessionListItem> {
        return this.toListItem(await this.getEntityById(examSessionId));
    }

    async createOne(dto: CreateExamSessionDto): Promise<ExamSessionListItem> {
        this.validateDates(dto);
        await this.assertNoSessionOverlap(dto.startDate, dto.endDate);
        dto.name = normalizeName(dto.name);
        await this.assertNameAvailable(dto.name);
        try {
            return this.toListItem(await this.repository.createOne(dto));
        } catch (error) {
            this.handleWriteError(error, 'Errore durante la creazione della sessione');
        }
    }

    async updateOne(examSessionId: number, dto: UpdateExamSessionDto): Promise<ExamSessionListItem> {
        const session = await this.getEntityById(examSessionId);
        const merged = {
            startDate: dto.startDate ?? this.toIso(session.startDate),
            endDate: dto.endDate ?? this.toIso(session.endDate),
            planningStartDate: dto.planningStartDate ?? this.toIso(session.planningStartDate),
            planningEndDate: dto.planningEndDate ?? this.toIso(session.planningEndDate),
        };
        this.validateDates(merged);
        await this.assertNoSessionOverlap(merged.startDate, merged.endDate, examSessionId);
        if (dto.name !== undefined) {
            dto.name = normalizeName(dto.name);
            await this.assertNameAvailable(dto.name, examSessionId);
        }
        try {
            const updated = await this.repository.updateOne(examSessionId, dto);
            if (!updated) {
                throw new NotFoundException(`Sessione con examSessionId ${examSessionId} non trovata`);
            }
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleWriteError(error, "Errore durante l'aggiornamento della sessione");
        }
    }

    async deleteOne(examSessionId: number): Promise<void> {
        // Una sessione con appelli pianificati non è eliminabile (FK RESTRICT):
        // controlliamo prima per dare un 409 chiaro invece del 400 generico.
        const linkedExams = await this.examsRepository.countByExamSession(examSessionId);
        if (linkedExams > 0) {
            throw new ConflictException(
                `Impossibile eliminare la sessione: ha ${linkedExams} appell${linkedExams === 1 ? 'o' : 'i'} collegat${linkedExams === 1 ? 'o' : 'i'}. Elimina prima gli appelli della sessione.`,
            );
        }
        try {
            const deleted = await this.repository.deleteOne(examSessionId);
            if (!deleted) {
                throw new NotFoundException(`Sessione con examSessionId ${examSessionId} non trovata`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione della sessione");
        }
    }
}
