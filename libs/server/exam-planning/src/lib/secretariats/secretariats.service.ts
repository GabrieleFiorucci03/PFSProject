import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { SecretariatEntity } from './secretariat.entity';
import { SecretariatsRepository } from './secretariats.repository';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';
import { handleDatabaseError } from '../database-error.helper';
import { normalizeName } from '../name-normalize.helper';
import { SecretariatListItem } from './interfaces/secretariat-list-item.interface';

/**
 * Logica di dominio dei segretari. La SEGRETERIA registra nuovi segretari (User +
 * profilo Secretariat in un'unica operazione atomica con rollback). Ogni segretario
 * può vedere, modificare ed eliminare solo il proprio profilo (self-only) e non
 * può cambiarsi l'email.
 */
@Injectable()
export class SecretariatsService {
    constructor(
        private readonly repository: SecretariatsRepository,
        private readonly usersService: ServerUsersService,
    ) {}

    // name/email dallo User collegato; passwordHash NON viene mai esposta.
    private toListItem(secretariat: SecretariatEntity): SecretariatListItem {
        return {
            id: secretariat.secretariatId,
            name: secretariat.user.name,
            email: secretariat.user.email,
        };
    }

    /** Tutti i segretari, come list-item. */
    async findAll(): Promise<SecretariatListItem[]> {
        const secretariats = await this.repository.findAll();
        return secretariats.map((secretariat) => this.toListItem(secretariat));
    }

    /** Il profilo del segretario autenticato (uso /secretariats/me). */
    async findOwn(currentUser: AuthenticatedUser): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findByUserId(currentUser.id);
        if (!secretariat) {
            throw new NotFoundException('Nessun segretario associato al tuo utente');
        }
        return this.toListItem(secretariat);
    }

    /** Un segretario per id, come list-item; 404 se non esiste. */
    async findById(secretariatId: number): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con id ${secretariatId} non trovato`);
        }
        return this.toListItem(secretariat);
    }

    /** Crea un segretario: crea prima lo User (ruolo forzato SEGRETERIA), poi il profilo; rollback dello User in caso di errore. */
    async createOne(dto: CreateSecretariatDto): Promise<SecretariatListItem> {
        // Il nome può ripetersi tra segretari: l'unicità è garantita dall'email
        // (vincolo sugli utenti). Qui normalizziamo solo gli spazi del nome.
        dto.name = normalizeName(dto.name);
        const user = await this.usersService.create({
            ...dto,
            role: UserRole.SEGRETERIA,
        });
        try {
            return this.toListItem(await this.repository.createOne(user));
        } catch (error) {
            await this.usersService.removeUser(user.id).catch(() => undefined);
            handleDatabaseError(error, 'Errore durante la creazione del segretario');
        }
    }

    /** Aggiorna il proprio profilo (self-only); l'email non è modificabile. */
    async updateOne(
        secretariatId: number,
        dto: UpdateSecretariatDto,
        currentUser: AuthenticatedUser,
    ): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con id ${secretariatId} non trovato`);
        }
        if (secretariat.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi modificare solo il tuo profilo');
        }
        if (dto.email !== undefined) {
            throw new ForbiddenException('Non puoi modificare la tua email');
        }
        if (dto.name !== undefined) {
            dto.name = normalizeName(dto.name);
        }
        try {
            await this.usersService.update(secretariat.user.id, dto);
            const updated = await this.repository.findById(secretariatId);
            if (!updated) {
                throw new NotFoundException(`Segretario con id ${secretariatId} non trovato`);
            }
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento del segretario");
        }
    }

    /** Elimina il proprio profilo (self-only) e il relativo User. */
    async deleteOne(secretariatId: number, currentUser: AuthenticatedUser): Promise<void> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con id ${secretariatId} non trovato`);
        }
        // Self-only: un segretario può eliminare solo il proprio account.
        if (secretariat.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi eliminare solo il tuo account');
        }
        try {
            await this.usersService.removeUser(secretariat.user.id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione del segretario");
        }
    }
}
