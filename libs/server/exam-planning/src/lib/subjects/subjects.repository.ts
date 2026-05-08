import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class SubjectsRepository {
    constructor(
        @InjectRepository(SubjectEntity)
        private readonly repository: Repository<SubjectEntity>,
    ) {}

    findAll(): Promise<SubjectEntity[]> {
        return this.repository.find({ order: { subjectId: 'ASC' } });
    }

    findById(subjectId: number): Promise<SubjectEntity | null> {
        return this.repository.findOne({ where: { subjectId } });
    }

    findByDegreeCourse(degreeCourseId: number): Promise<SubjectEntity[]> {
        return this.repository.find({
            where: { degreeCourse: { id: degreeCourseId } },
            order: { year: 'ASC', name: 'ASC' },
        });
    }

    findByTeacher(teacherId: number): Promise<SubjectEntity[]> {
        return this.repository.find({
            where: { teacher: { teacherId } },
            order: { year: 'ASC', name: 'ASC' },
        });
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
