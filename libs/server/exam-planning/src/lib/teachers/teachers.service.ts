import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { TeacherEntity } from './teacher.entity';
import { TeachersRepository } from './teachers.repository';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { handleDatabaseError } from '../database-error.helper';

@Injectable()
export class TeachersService {
    constructor(
        private readonly repository: TeachersRepository,
        private readonly usersService: ServerUsersService,
    ) {}

    findAll(): Promise<TeacherEntity[]> {
        return this.repository.findAll();
    }

    async findOwn(currentUser: AuthenticatedUser): Promise<TeacherEntity> {
        const teacher = await this.repository.findByUserId(currentUser.id);
        if (!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        return teacher;
    }

    async findById(id: number, currentUser: AuthenticatedUser): Promise<TeacherEntity> {
        const teacher = await this.repository.findById(id);
        if (!teacher) {
            throw new NotFoundException(`Docente con id ${id} non trovato`);
        }
        if (currentUser.role === UserRole.DOCENTE && teacher.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi accedere solo al tuo profilo');
        }
        return teacher;
    }

    async createOne(dto: CreateTeacherDto): Promise<TeacherEntity> {
        const user = await this.usersService.create({
            ...dto,
            role: UserRole.DOCENTE,
        });
        try {
            return await this.repository.createOne(user);
        } catch (error) {
            await this.usersService.removeUser(user.id).catch(() => undefined);
            handleDatabaseError(error, 'Errore durante la creazione del docente');
        }
    }

    async updateOne(
        id: number,
        dto: UpdateTeacherDto,
        currentUser: AuthenticatedUser,
    ): Promise<TeacherEntity> {
        const teacher = await this.repository.findById(id);
        if (!teacher) {
            throw new NotFoundException(`Docente con id ${id} non trovato`);
        }

        if (currentUser.role === UserRole.DOCENTE) {
            if (teacher.user.id !== currentUser.id) {
                throw new ForbiddenException('Puoi modificare solo il tuo profilo');
            }
            if (dto.email !== undefined) {
                throw new ForbiddenException('Non puoi modificare la tua email');
            }
        }

        try {
            await this.usersService.update(teacher.user.id, dto);
            const updated = await this.repository.findById(id);
            if (!updated) {
                throw new NotFoundException(`Docente con id ${id} non trovato`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento del docente");
        }
    }

    async deleteOne(id: number): Promise<void> {
        const teacher = await this.repository.findById(id);
        if (!teacher) {
            throw new NotFoundException(`Docente con id ${id} non trovato`);
        }
        try {
            await this.usersService.removeUser(teacher.user.id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione del docente");
        }
    }
}
