import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherEntity } from './teacher.entity';
import { UserEntity } from '@server/users';

/**
 * Repository CRUD dei profili docente (solo accesso ai dati). Lo `user` è eager,
 * quindi ogni docente arriva già con nome/email/ruolo collegati.
 */
@Injectable()
export class TeachersRepository {
    constructor(
        @InjectRepository(TeacherEntity)
        private readonly repository: Repository<TeacherEntity>,
    ) {}

    /** Tutti i docenti, ordinati per id. */
    findAll(): Promise<TeacherEntity[]> {
        return this.repository.find({ order: { teacherId: 'ASC' } });
    }

    /** Un docente per id; `null` se non esiste. */
    findById(teacherId: number): Promise<TeacherEntity | null> {
        return this.repository.findOne({ where: { teacherId } });
    }

    /** Il profilo docente associato a un dato utente; `null` se quell'utente non è docente. */
    findByUserId(userId: number): Promise<TeacherEntity | null> {
        return this.repository.findOne({ where: { user: { id: userId } } });
    }

    /** Crea il profilo docente collegandolo all'utente già creato. */
    async createOne(user: UserEntity): Promise<TeacherEntity> {
        const teacher = this.repository.create({ user });
        return this.repository.save(teacher);
    }

    /** Elimina un docente per id; `true` se rimosso. */
    async deleteOne(teacherId: number): Promise<boolean> {
        const result = await this.repository.delete(teacherId);
        return (result.affected ?? 0) > 0;
    }
}
