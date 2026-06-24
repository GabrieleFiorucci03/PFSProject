import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { TeacherEntity } from './teacher.entity';
import { TeachersRepository } from './teachers.repository';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { handleDatabaseError } from '../database-error.helper';
import { normalizeName } from '../name-normalize.helper';
import { TeacherListItem } from './interfaces/teacher-list-item.interface';

@Injectable()
export class TeachersService {
    constructor(
        private readonly repository: TeachersRepository,
        private readonly usersService: ServerUsersService,
    ) {}

    // name/email dallo User collegato; passwordHash NON viene mai esposta.
    private toListItem(teacher: TeacherEntity): TeacherListItem {
        return {
            id: teacher.teacherId,
            name: teacher.user.name,
            email: teacher.user.email,
        };
    }

    async findAll(): Promise<TeacherListItem[]> {
        const teachers = await this.repository.findAll();
        return teachers.map((teacher) => this.toListItem(teacher));
    }

    async findOwn(currentUser: AuthenticatedUser): Promise<TeacherListItem> {
        const teacher = await this.repository.findByUserId(currentUser.id);
        if (!teacher) {
            throw new NotFoundException('Nessun docente associato al tuo utente');
        }
        return this.toListItem(teacher);
    }

    async findById(teacherId: number, currentUser: AuthenticatedUser): Promise<TeacherListItem> {
        const teacher = await this.repository.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException(`Docente con teacherId ${teacherId} non trovato`);
        }
        if (currentUser.role === UserRole.DOCENTE && teacher.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi accedere solo al tuo profilo');
        }
        return this.toListItem(teacher);
    }

    async createOne(dto: CreateTeacherDto): Promise<TeacherListItem> {
        // Il nome può ripetersi tra docenti: l'unicità è garantita dall'email
        // (vincolo sugli utenti). Qui normalizziamo solo gli spazi del nome.
        dto.name = normalizeName(dto.name);
        const user = await this.usersService.create({
            ...dto,
            role: UserRole.DOCENTE,
        });
        try {
            return this.toListItem(await this.repository.createOne(user));
        } catch (error) {
            await this.usersService.removeUser(user.id).catch(() => undefined);
            handleDatabaseError(error, 'Errore durante la creazione del docente');
        }
    }

    async updateOne(
        teacherId: number,
        dto: UpdateTeacherDto,
        currentUser: AuthenticatedUser,
    ): Promise<TeacherListItem> {
        const teacher = await this.repository.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException(`Docente con teacherId ${teacherId} non trovato`);
        }

        if (currentUser.role === UserRole.DOCENTE) {
            if (teacher.user.id !== currentUser.id) {
                throw new ForbiddenException('Puoi modificare solo il tuo profilo');
            }
            if (dto.email !== undefined) {
                throw new ForbiddenException('Non puoi modificare la tua email');
            }
        }

        if (dto.name !== undefined) {
            dto.name = normalizeName(dto.name);
        }

        try {
            await this.usersService.update(teacher.user.id, dto);
            const updated = await this.repository.findById(teacherId);
            if (!updated) {
                throw new NotFoundException(`Docente con teacherId ${teacherId} non trovato`);
            }
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento del docente");
        }
    }

    async deleteOne(teacherId: number, currentUser: AuthenticatedUser): Promise<void> {
        const teacher = await this.repository.findById(teacherId);
        if (!teacher) {
            throw new NotFoundException(`Docente con teacherId ${teacherId} non trovato`);
        }
        // Un docente può eliminare solo il proprio account (self-only); la
        // segreteria può eliminare qualsiasi docente.
        if (currentUser.role === UserRole.DOCENTE && teacher.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi eliminare solo il tuo profilo');
        }
        try {
            await this.usersService.removeUser(teacher.user.id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione del docente");
        }
    }
}
