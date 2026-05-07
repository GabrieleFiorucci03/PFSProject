import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherEntity } from './teacher.entity';
import { UserEntity } from '@server/users';

@Injectable()
export class TeachersRepository {
    constructor(
        @InjectRepository(TeacherEntity)
        private readonly repository: Repository<TeacherEntity>,
    ) {}

    findAll(): Promise<TeacherEntity[]> {
        return this.repository.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<TeacherEntity | null> {
        return this.repository.findOne({ where: { id } });
    }

    findByUserId(userId: number): Promise<TeacherEntity | null> {
        return this.repository.findOne({ where: { user: { id: userId } } });
    }

    async createOne(user: UserEntity): Promise<TeacherEntity> {
        const teacher = this.repository.create({ user });
        return this.repository.save(teacher);
    }

    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
