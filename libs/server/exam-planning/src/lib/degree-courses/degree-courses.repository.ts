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

    findById(id: number): Promise<DegreeCourseEntity | null> {
        return this.repository.findOne({where: {id}});
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

    async updateOne(id: number, dto: UpdateDegreeCourseDto): Promise<DegreeCourseEntity | null>{
        const degreeCourse = await this.findById(id);
        if(!degreeCourse) return null;
        if(dto.yearsDuration !== undefined) degreeCourse.yearsDuration = dto.yearsDuration;
        if(dto.name !== undefined)degreeCourse.name = dto.name;
        if(dto.department !== undefined)degreeCourse.department = dto.department;
        return this.repository.save(degreeCourse);
    }

    async deleteOne(id: number): Promise<boolean>{
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

}