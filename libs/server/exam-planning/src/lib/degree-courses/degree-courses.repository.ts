import { Injectable } from "@nestjs/common";
import { DegreeCourseEntity } from "./degree-course.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDegreeCourseDto } from "./dto/create-degree-course.dto";
import { UpdateDegreeCourseDto } from "./dto/update-degree-course.dto";

@Injectable()
export class DegreeCoursesRepository {
    constructor(
        @InjectRepository(DegreeCourseEntity)
        private readonly repository: Repository<DegreeCourseEntity>
    ) {}

    findAll(): Promise<DegreeCourseEntity[]> {
        return this.repository.find({order: {name: 'ASC'}});
    }

    findById(degreeCourseId: number): Promise<DegreeCourseEntity | null> {
        return this.repository.findOne({where: {degreeCourseId}});
    }

    // Corsi di laurea "assegnati" a un docente: quelli che hanno almeno un
    // insegnamento (subject) tenuto da quel docente. Il legame è indiretto
    // (degreeCourse -> subjects -> teacher); il where annidato genera i join e
    // l'hydration di TypeORM restituisce i corsi distinti.
    findByTeacherId(teacherId: number): Promise<DegreeCourseEntity[]> {
        return this.repository.find({
            where: { subjects: { teacher: { teacherId } } },
            order: { name: 'ASC' },
        });
    }

    findByName(name: string): Promise<DegreeCourseEntity | null> {
        return this.repository.findOne({where: {name}});
    }

    async createOne(dto: CreateDegreeCourseDto): Promise<DegreeCourseEntity> {
        const degreeCourse = this.repository.create({
            name: dto.name,
            yearsDuration: dto.yearsDuration ?? 3,
            department: dto.department
        });
        return this.repository.save(degreeCourse);
    }

    async updateOne(degreeCourseId: number, dto: UpdateDegreeCourseDto): Promise<DegreeCourseEntity | null>{
        const degreeCourse = await this.findById(degreeCourseId);
        if(!degreeCourse) return null;
        if(dto.yearsDuration !== undefined) degreeCourse.yearsDuration = dto.yearsDuration;
        if(dto.name !== undefined) degreeCourse.name = dto.name;
        if(dto.department !== undefined) degreeCourse.department = dto.department;
        return this.repository.save(degreeCourse);
    }

    async deleteOne(degreeCourseId: number): Promise<boolean>{
        const result = await this.repository.delete(degreeCourseId);
        return (result.affected ?? 0) > 0;
    }

}
