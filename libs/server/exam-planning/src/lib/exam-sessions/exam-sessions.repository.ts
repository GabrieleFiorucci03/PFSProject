import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { ExamSessionEntity } from "./exam-sessions.entity";
import { Repository } from 'typeorm';
import { CreateExamSessionDto } from "./dto/create-exam-session.dto";
import { UpdateExamSessionDto } from "./dto/update-exam-session.dto";


@Injectable()
export class ExamSessionsRepository {
    constructor(
        @InjectRepository(ExamSessionEntity)
        private readonly repository: Repository<ExamSessionEntity>
    ) {}

    findAll(): Promise<ExamSessionEntity[]> {
        return this.repository.find({order: {name: 'ASC'}});
    }

    findById(examSessionId: number): Promise<ExamSessionEntity | null> {
        return this.repository.findOne({where: {examSessionId}});
    }

    async createOne(dto: CreateExamSessionDto): Promise<ExamSessionEntity> {
        const examSession = this.repository.create({
            name: dto.name,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            planningStartDate: new Date(dto.planningStartDate),
            planningEndDate: new Date(dto.planningEndDate),
        });
        return this.repository.save(examSession);
    }

    async updateOne(examSessionId: number, dto: UpdateExamSessionDto): Promise<ExamSessionEntity | null> {
        const examSession = await this.findById(examSessionId);
        if(!examSession) return null;
        if(dto.name !== undefined) examSession.name = dto.name;
        if(dto.startDate !== undefined) examSession.startDate = new Date(dto.startDate);
        if(dto.endDate !== undefined) examSession.endDate = new Date(dto.endDate);
        if(dto.planningStartDate !== undefined) examSession.planningStartDate = new Date(dto.planningStartDate);
        if(dto.planningEndDate !== undefined) examSession.planningEndDate = new Date(dto.planningEndDate);
        return this.repository.save(examSession);
    }

    async deleteOne(examSessionId: number): Promise<boolean> {
        const result = await this.repository.delete(examSessionId);
        return (result.affected ?? 0) > 0;
    }

}
