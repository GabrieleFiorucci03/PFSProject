import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '@server/auth';
import { SubjectEntity } from './subject.entity';
import {
  SubjectsRepository,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  SubjectFilters,
} from './subjects.repository';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { DegreeCoursesRepository } from '../degree-courses/degree-courses.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { DegreeCourseEntity } from '../degree-courses/degree-course.entity';
import { TeacherEntity } from '../teachers/teacher.entity';
import { handleDatabaseError } from '../database-error.helper';
import { SubjectListItem } from './interfaces/subject-list-item.interface';


@Injectable()
export class SubjectsService {

    constructor(
        private readonly repository: SubjectsRepository,
        private readonly teacherRepository: TeachersRepository,
        private readonly degreeCourseRepository: DegreeCoursesRepository,
    ) {}

    // FK annidate {id, name}: l'id serve ai form, il name alla tabella.
    private toListItem(subject: SubjectEntity): SubjectListItem {
        return {
            id: subject.subjectId,
            name: subject.name,
            year: subject.year,
            cfu: subject.cfu,
            degreeCourse: {
                id: subject.degreeCourse.degreeCourseId,
                name: subject.degreeCourse.name,
                department: subject.degreeCourse.department,
            },
            teacher: {
                id: subject.teacher.teacherId,
                name: subject.teacher.user.name,
            },
        };
    }

    private async getEntityById(subjectId: number): Promise<SubjectEntity> {
        const subject = await this.repository.findById(subjectId);
        if(!subject) throw new NotFoundException(`Materia con subjectId ${subjectId} non trovata`);
        return subject;
    }

    private async resolveDegreeCourse(degreeCourseId: number): Promise<DegreeCourseEntity> {
        const degreeCourse = await this.degreeCourseRepository.findById(degreeCourseId);
        if(!degreeCourse) throw new NotFoundException(`Corso di laurea con degreeCourseId ${degreeCourseId} non trovato`);
        return degreeCourse;
    }

    private async resolveTeacher(teacherId: number): Promise<TeacherEntity> {
        const teacher = await this.teacherRepository.findById(teacherId);
        if(!teacher) throw new NotFoundException(`Insegnante con teacherId ${teacherId} non trovato`);
        return teacher;
    }

    private validateYear(year: number, degreeCourse: DegreeCourseEntity): void {
        if(year < 1 || year > degreeCourse.yearsDuration) throw new BadRequestException( `L'anno deve essere compreso tra 1 e ${degreeCourse.yearsDuration} per il corso "${degreeCourse.name}"`,);
    }

    async findAll(filters: SubjectFilters = {}): Promise<SubjectListItem[]> {
        if (filters.degreeCourseId !== undefined) {
            await this.resolveDegreeCourse(filters.degreeCourseId);
        }
        if (filters.teacherId !== undefined) {
            await this.resolveTeacher(filters.teacherId);
        }
        const subjects = await this.repository.findAllFiltered(filters);
        return subjects.map((subject) => this.toListItem(subject));
    }

    async findById(subjectId: number): Promise<SubjectListItem> {
        return this.toListItem(await this.getEntityById(subjectId));
    }

    async findOwnSubjects(currentUser: AuthenticatedUser): Promise<SubjectListItem[]> {
        const teacher = await this.teacherRepository.findByUserId(currentUser.id);
        if(!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        const subjects = await this.repository.findAllFiltered({ teacherId: teacher.teacherId });
        return subjects.map((subject) => this.toListItem(subject));
    }

    async createOne(dto: CreateSubjectDto): Promise<SubjectListItem> {
        const degreeCourse = await this.resolveDegreeCourse(dto.degreeCourseId);
        const teacher = await this.resolveTeacher(dto.teacherId);
        this.validateYear(dto.year, degreeCourse);

        const payload: CreateSubjectPayload = {
            name: dto.name,
            year: dto.year,
            cfu: dto.cfu,
            degreeCourse,
            teacher,
        };

        try {
            return this.toListItem(await this.repository.createOne(payload));
        } catch (error) {
            handleDatabaseError(error, 'Errore durante la creazione della materia');
        }
    }

     async updateOne(subjectId: number, dto: UpdateSubjectDto): Promise<SubjectListItem> {
          const existing = await this.getEntityById(subjectId);

          const payload: UpdateSubjectPayload = {};
          if (dto.name !== undefined) payload.name = dto.name;
          if (dto.cfu !== undefined) payload.cfu = dto.cfu;
          if (dto.year !== undefined) payload.year = dto.year;
          if (dto.degreeCourseId !== undefined) {
              payload.degreeCourse = await this.resolveDegreeCourse(dto.degreeCourseId);
          }
          if (dto.teacherId !== undefined) {
              payload.teacher = await this.resolveTeacher(dto.teacherId);
          }

          if (payload.year !== undefined || payload.degreeCourse !== undefined) {
              const finalYear = payload.year ?? existing.year;
              const finalDegreeCourse = payload.degreeCourse ?? existing.degreeCourse;
              this.validateYear(finalYear, finalDegreeCourse);
          }

          try {
              const updated = await this.repository.updateOne(subjectId, payload);
              if (!updated) {
                  throw new NotFoundException(`Materia con subjectId ${subjectId} non trovata`);
              }
              return this.toListItem(updated);
          } catch (error) {
              if (error instanceof NotFoundException) throw error;
              handleDatabaseError(error, "Errore durante l'aggiornamento della materia");
          }
    }

    async deleteOne(subjectId: number): Promise<void> {
         try {
              const deleted = await this.repository.deleteOne(subjectId);
              if (!deleted) {
                  throw new NotFoundException(`Materia con subjectId ${subjectId} non trovata`);
              }
          } catch (error) {
              if (error instanceof NotFoundException) throw error;
              handleDatabaseError(error, "Errore durante l'eliminazione della materia");
          }
    }

}
