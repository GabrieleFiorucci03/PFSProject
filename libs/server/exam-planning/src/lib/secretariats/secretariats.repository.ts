import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecretariatEntity } from './secretariat.entity';
import { UserEntity } from '@server/users';

@Injectable()
export class SecretariatsRepository {
    constructor(
        @InjectRepository(SecretariatEntity)
        private readonly repository: Repository<SecretariatEntity>,
    ) {}

    findAll(): Promise<SecretariatEntity[]> {
        return this.repository.find({ order: { secretariatId: 'ASC' } });
    }

    findById(secretariatId: number): Promise<SecretariatEntity | null> {
        return this.repository.findOne({ where: { secretariatId } });
    }

    findByUserId(userId: number): Promise<SecretariatEntity | null> {
        return this.repository.findOne({ where: { user: { id: userId } } });
    }

    async createOne(user: UserEntity): Promise<SecretariatEntity> {
        const secretariat = this.repository.create({ user });
        return this.repository.save(secretariat);
    }

    async deleteOne(secretariatId: number): Promise<boolean> {
        const result = await this.repository.delete(secretariatId);
        return (result.affected ?? 0) > 0;
    }
}
