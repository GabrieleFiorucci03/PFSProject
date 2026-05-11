import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { SubjectEntity } from './subject.entity';
import { DegreeCourseEntity } from '../degree-courses/degree-course.entity';
import { TeacherEntity } from '../teachers/teacher.entity';

export type CreateSubjectPayload = {
    name: string;
    year: number;
    cfu: number;
    degreeCourse: DegreeCourseEntity;
    teacher: TeacherEntity;
};

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

export type SubjectFilters = {
    degreeCourseId?: number;
    teacherId?: number;
};

@Injectable()
export class SubjectsRepository {
    constructor(
        @InjectRepository(SubjectEntity)
        private readonly repository: Repository<SubjectEntity>,
    ) {}

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

    findById(subjectId: number): Promise<SubjectEntity | null> {
        return this.repository.findOne({ where: { subjectId } });
    }

    async createOne(payload: CreateSubjectPayload): Promise<SubjectEntity> {
        const subject = this.repository.create(payload);
        return this.repository.save(subject);
    }

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

    async deleteOne(subjectId: number): Promise<boolean> {
        const result = await this.repository.delete(subjectId);
        return (result.affected ?? 0) > 0;
    }
}
