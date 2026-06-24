import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SubjectEntity } from './subject.entity';
import { DegreeCourseEntity } from '../degree-courses/degree-course.entity';
import { TeacherEntity } from '../teachers/teacher.entity';

/** Dati per creare un insegnamento: le FK sono già entità risolte dal service. */
export type CreateSubjectPayload = {
    name: string;
    year: number;
    cfu: number;
    degreeCourse: DegreeCourseEntity;
    teacher: TeacherEntity;
};

/** Dati per l'aggiornamento: stessi campi del create, tutti opzionali. */
export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

/** Filtri opzionali per la lista insegnamenti (per corso e/o per docente). */
export type SubjectFilters = {
    degreeCourseId?: number;
    teacherId?: number;
};

/** Repository CRUD degli insegnamenti (solo accesso ai dati). */
@Injectable()
export class SubjectsRepository {
    constructor(
        @InjectRepository(SubjectEntity)
        private readonly repository: Repository<SubjectEntity>,
    ) {}

    /** Insegnamenti, eventualmente filtrati per corso e/o docente; ordinati per anno e nome. */
    findAllFiltered(filters: SubjectFilters = {}): Promise<SubjectEntity[]> {
        const where: FindOptionsWhere<SubjectEntity> = {};
        if (filters.degreeCourseId !== undefined) {
            where.degreeCourse = { degreeCourseId: filters.degreeCourseId };
        }
        if (filters.teacherId !== undefined) {
            where.teacher = { teacherId: filters.teacherId };
        }
        return this.repository.find({
            where,
            order: { year: 'ASC', name: 'ASC' },
        });
    }

    /** Un insegnamento per id; `null` se non esiste. */
    findById(subjectId: number): Promise<SubjectEntity | null> {
        return this.repository.findOne({ where: { subjectId } });
    }

    /** Quanti insegnamenti appartengono a un corso (per bloccarne l'eliminazione se >0). */
    countByDegreeCourse(degreeCourseId: number): Promise<number> {
        return this.repository.count({
            where: { degreeCourse: { degreeCourseId } },
        });
    }

    /** Quanti insegnamenti sono tenuti da un docente (per bloccarne l'eliminazione se >0). */
    countByTeacher(teacherId: number): Promise<number> {
        return this.repository.count({ where: { teacher: { teacherId } } });
    }

    /** Crea e salva un insegnamento. */
    async createOne(payload: CreateSubjectPayload): Promise<SubjectEntity> {
        const subject = this.repository.create(payload);
        return this.repository.save(subject);
    }

    /** Aggiorna i campi forniti; ritorna l'entità aggiornata o `null` se l'id non esiste. */
    async updateOne(subjectId: number, payload: UpdateSubjectPayload): Promise<SubjectEntity | null> {
        const subject = await this.findById(subjectId);
        if (!subject) return null;
        if (payload.name !== undefined) subject.name = payload.name;
        if (payload.year !== undefined) subject.year = payload.year;
        if (payload.cfu !== undefined) subject.cfu = payload.cfu;
        if (payload.degreeCourse !== undefined) subject.degreeCourse = payload.degreeCourse;
        if (payload.teacher !== undefined) subject.teacher = payload.teacher;
        return this.repository.save(subject);
    }

    /** Elimina un insegnamento per id; `true` se rimosso. */
    async deleteOne(subjectId: number): Promise<boolean> {
        const result = await this.repository.delete(subjectId);
        return (result.affected ?? 0) > 0;
    }
}
