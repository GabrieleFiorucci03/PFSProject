import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from '@server/security';
import * as bcrypt from 'bcrypt';

/**
 * Logica applicativa sugli utenti: hashing password, controllo unicità email,
 * traduzione di "non trovato" in 404. Usato sia dall'auth sia dai profili
 * docente/segretario (che creano/aggiornano l'utente sottostante).
 */
@Injectable()
export class ServerUsersService {

    constructor(private readonly usersRepository: UsersRepository){}

    /** Cerca un utente per email; ritorna `null` se assente (vedi nota sotto). */
    async findByEmail(email: string): Promise<UserEntity | null> {
        // Ritorna null se non trovato: il chiamante (auth validateUser) decide la
        // risposta. Evita di distinguere "email inesistente" (404) da "password
        // errata" (401), che permetterebbe user enumeration.
        return this.usersRepository.findByEmail(email);
    }

    /** Recupera un utente per id; 404 se non esiste. */
    async getOneUser(id: number): Promise<UserEntity> {
        const user = await this.usersRepository.findById(id);

        if(!user) throw new NotFoundException(`Utente con id ${id} non trovato`);

        return user;
    }

    /** Elenco utenti, opzionalmente filtrato per ruolo (lista vuota = 200 con []). */
    async getUsers(role?: UserRole): Promise<UserEntity[]> {
        // Lista vuota -> 200 con []: un filtro senza risultati non e' un errore.
        return this.usersRepository.findAll(role);
    }

    /** Crea un utente: verifica email non già usata (409) e ne hasha la password con bcrypt. */
    async create(dto: CreateUserDto): Promise<UserEntity> {
        const existing = dto.email
            ? await this.usersRepository.findByEmail(dto.email)
            : null;

        if (existing) {
            throw new ConflictException('Email già in uso');
        }

        const passwordHash = await bcrypt.hash(dto.password,10);
        return this.usersRepository.createOne(dto,passwordHash);
    }

    // Il dto può includere una nuova `password` (profili docente/segreteria): la
    // ri-hashiamo qui, così il repository riceve sempre l'hash e mai la password
    // in chiaro. UpdateUserDto omette `password`, quindi la tipizziamo a parte.
    async update(id: number, dto: UpdateUserDto & { password?: string }): Promise<UserEntity> {
        if (dto.email) {
            const existing = await this.usersRepository.findByEmail(dto.email);
            if (existing && existing.id !== id) {
                throw new ConflictException('Email già in uso');
            }
        }

        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 10)
            : undefined;

        try {
            const updated = await this.usersRepository.updateOne(id, dto, passwordHash);
            if (!updated) {
                throw new NotFoundException(`Utente con id ${id} non trovato`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            // pg unique_violation: email duplicata in una race concorrente
            // (il pre-check sopra non copre due update simultanei).
            if ((error as { code?: string })?.code === '23505') {
                throw new ConflictException('Email già in uso');
            }
            throw error;
        }
    }

    /** Elimina un utente per id; 404 se non esisteva. */
    async removeUser(id: number): Promise<void> {
        const deleted = await this.usersRepository.deleteOne(id);
        if (!deleted) {
            throw new NotFoundException(`Utente con id ${id} non trovato`);
        }
    }
}
