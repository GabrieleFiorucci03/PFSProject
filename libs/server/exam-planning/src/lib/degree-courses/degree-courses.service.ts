import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '@server/auth';
import { DegreeCourseEntity } from './degree-course.entity';
import { DegreeCoursesRepository } from './degree-courses.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { handleDatabaseError } from '../database-error.helper';
import { UpdateDegreeCourseDto } from './dto/update-degree-course.dto';
import { CreateDegreeCourseDto } from './dto/create-degree-course.dto';
import { DegreeCourseListItem } from './interfaces/degree-course-list-item.interface';

@Injectable()
export class DegreeCoursesService {
    constructor(
        private readonly repository: DegreeCoursesRepository,
        private readonly teacherRepository: TeachersRepository,
    ) {}

    private toListItem(dc: DegreeCourseEntity): DegreeCourseListItem {
        return {
            id: dc.degreeCourseId,
            name: dc.name,
            yearsDuration: dc.yearsDuration,
            department: dc.department,
        };
    }

    async findAll(): Promise<DegreeCourseListItem[]> {
        const degreeCourses = await this.repository.findAll();
        return degreeCourses.map((dc) => this.toListItem(dc));
    }

    async findById(degreeCourseId: number): Promise<DegreeCourseListItem> {
        const degreeCourse = await this.repository.findById(degreeCourseId);
        if (!degreeCourse) throw new NotFoundException(`Corso di laurea con degreeCourseId ${degreeCourseId} non trovato`);
        return this.toListItem(degreeCourse);
    }

    // Solo i corsi di laurea assegnati al docente corrente (via i suoi subjects).
    async findOwnDegreeCourses(currentUser: AuthenticatedUser): Promise<DegreeCourseListItem[]> {
        const teacher = await this.teacherRepository.findByUserId(currentUser.id);
        if (!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        const degreeCourses = await this.repository.findByTeacherId(teacher.teacherId);
        return degreeCourses.map((dc) => this.toListItem(dc));
    }

    async createOne(dto: CreateDegreeCourseDto): Promise<DegreeCourseListItem> {
        try {
            return this.toListItem(await this.repository.createOne(dto));
        } catch (error) {
            handleDatabaseError(error, 'Errore durante la creazione del corso di laurea');
        }
    }

    async updateOne(degreeCourseId: number, dto: UpdateDegreeCourseDto): Promise<DegreeCourseListItem> {
        try {
            const updated = await this.repository.updateOne(degreeCourseId, dto);
            if (!updated) throw new NotFoundException(`Corso di laurea con degreeCourseId ${degreeCourseId} non trovato`);
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento del corso di laurea");
        }
    }

    async deleteOne(degreeCourseId: number): Promise<void> {
        try {
            const deleted = await this.repository.deleteOne(degreeCourseId);
            if (!deleted) throw new NotFoundException(`Corso di laurea con degreeCourseId ${degreeCourseId} non trovato`);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione del corso di laurea");
        }
    }

}
