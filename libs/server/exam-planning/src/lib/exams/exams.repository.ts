import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ExamEntity } from './exam.entity';
import { SubjectEntity } from '../subjects/subject.entity';
import { ExamSessionEntity } from '../exam-sessions/exam-sessions.entity';
import { TeacherEntity } from '../teachers/teacher.entity';
import { ExamType } from './dto/exam-type.enum';
import { RoomType } from './dto/room-type.enum';

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

export type UpdateExamPayload = Partial<CreateExamPayload>;

@Injectable()
export class ExamsRepository {
    constructor(
        @InjectRepository(ExamEntity)
        private readonly repository: Repository<ExamEntity>,
    ) {}

    findAll(): Promise<ExamEntity[]> {
        return this.repository.find({ order: { examId: 'ASC' } });
    }

    findById(examId: number): Promise<ExamEntity | null> {
        return this.repository.findOne({ where: { examId } });
    }

    findByTeacher(teacherId: number): Promise<ExamEntity[]> {
        return this.repository.find({
            where: { teacher: { teacherId } },
            order: { date: 'ASC' },
        });
    }

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
                degreeCourse: { id: degreeCourseId },
            },
        };
        if (excludeExamId !== undefined) {
            where['examId'] = Not(excludeExamId);
        }
        return this.repository.findOne({ where });
    }

    async createOne(payload: CreateExamPayload): Promise<ExamEntity> {
        const exam = this.repository.create(payload);
        return this.repository.save(exam);
    }

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

    async deleteOne(examId: number): Promise<boolean> {
        const result = await this.repository.delete(examId);
        return (result.affected ?? 0) > 0;
    }
}
