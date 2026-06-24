import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecretariatEntity } from './secretariat.entity';
import { UserEntity } from '@server/users';

/**
 * Repository CRUD dei profili segretario (solo accesso ai dati). Lo `user` è eager,
 * quindi ogni segretario arriva già con nome/email/ruolo collegati.
 */
@Injectable()
export class SecretariatsRepository {
    constructor(
        @InjectRepository(SecretariatEntity)
        private readonly repository: Repository<SecretariatEntity>,
    ) {}

    /** Tutti i segretari, ordinati per id. */
    findAll(): Promise<SecretariatEntity[]> {
        return this.repository.find({ order: { secretariatId: 'ASC' } });
    }

    /** Un segretario per id; `null` se non esiste. */
    findById(secretariatId: number): Promise<SecretariatEntity | null> {
        return this.repository.findOne({ where: { secretariatId } });
    }

    /** Il profilo segretario associato a un dato utente; `null` se non lo è. */
    findByUserId(userId: number): Promise<SecretariatEntity | null> {
        return this.repository.findOne({ where: { user: { id: userId } } });
    }

    /** Crea il profilo segretario collegandolo all'utente già creato. */
    async createOne(user: UserEntity): Promise<SecretariatEntity> {
        const secretariat = this.repository.create({ user });
        return this.repository.save(secretariat);
    }

    /** Elimina un segretario per id; `true` se rimosso. */
    async deleteOne(secretariatId: number): Promise<boolean> {
        const result = await this.repository.delete(secretariatId);
        return (result.affected ?? 0) > 0;
    }
}
