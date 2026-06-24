import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@server/security';

/**
 * Repository CRUD degli utenti (incapsula il `Repository<UserEntity>` di TypeORM).
 * Solo accesso ai dati: nessuna eccezione HTTP, ritorna `null`/`boolean` per
 * segnalare assenza/esito. La logica applicativa sta nel `ServerUsersService`.
 */
@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>) {}

    /** Cerca un utente per email (univoca). `null` se non esiste. */
    findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({where: {email}});
    }

    /** Cerca un utente per id. `null` se non esiste. */
    findById(id: number): Promise<UserEntity | null> {
        return this.repository.findOne({where: {id}});
    }

    /** Crea e salva un nuovo utente con l'hash password già calcolato dal service. */
    async createOne(dto: CreateUserDto, passwordHash: string): Promise<UserEntity> {
        const user = this.repository.create({
            name: dto.name,
            email: dto.email,
            passwordHash: passwordHash,
            role: dto.role
        });
        return this.repository.save(user);
    }

    /** Tutti gli utenti (ordine per id), opzionalmente filtrati per ruolo. */
    findAll(role?: UserRole): Promise<UserEntity[]> {
        if (role) {
            return this.repository.find({
                where: { role },
                order: { id: 'ASC' },
            });
        }
        return this.repository.find({order: {id: 'ASC'}});
    }

    /**
     * Aggiorna i campi forniti (name/email/role e, se passato, il nuovo hash
     * password). Ritorna l'entità aggiornata, o `null` se l'utente non esiste.
     */
    async updateOne(id: number, dto: UpdateUserDto, passwordHash?: string): Promise<UserEntity|null> {
        const user = await this.findById(id);
        if(!user)
            return null;
        if (dto.name !== undefined) user.name = dto.name;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;
        if (passwordHash !== undefined) user.passwordHash = passwordHash;

        return this.repository.save(user);
    }

    /** Elimina l'utente per id. Ritorna `true` se una riga è stata rimossa. */
    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
