import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { SecretariatEntity } from './secretariat.entity';
import { SecretariatsRepository } from './secretariats.repository';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';
import { handleDatabaseError } from '../database-error.helper';
import { SecretariatListItem } from './interfaces/secretariat-list-item.interface';

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

    async findAll(): Promise<SecretariatListItem[]> {
        const secretariats = await this.repository.findAll();
        return secretariats.map((secretariat) => this.toListItem(secretariat));
    }

    async findOwn(currentUser: AuthenticatedUser): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findByUserId(currentUser.id);
        if (!secretariat) {
            throw new NotFoundException('Nessun segretario associato al tuo utente');
        }
        return this.toListItem(secretariat);
    }

    async findById(secretariatId: number): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con secretariatId ${secretariatId} non trovato`);
        }
        return this.toListItem(secretariat);
    }

    async createOne(dto: CreateSecretariatDto): Promise<SecretariatListItem> {
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

    async updateOne(
        secretariatId: number,
        dto: UpdateSecretariatDto,
        currentUser: AuthenticatedUser,
    ): Promise<SecretariatListItem> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con secretariatId ${secretariatId} non trovato`);
        }
        if (secretariat.user.id !== currentUser.id) {
            throw new ForbiddenException('Puoi modificare solo il tuo profilo');
        }
        if (dto.email !== undefined) {
            throw new ForbiddenException('Non puoi modificare la tua email');
        }
        try {
            await this.usersService.update(secretariat.user.id, dto);
            const updated = await this.repository.findById(secretariatId);
            if (!updated) {
                throw new NotFoundException(`Segretario con secretariatId ${secretariatId} non trovato`);
            }
            return this.toListItem(updated);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof ForbiddenException) throw error;
            handleDatabaseError(error, "Errore durante l'aggiornamento del segretario");
        }
    }

    async deleteOne(secretariatId: number): Promise<void> {
        const secretariat = await this.repository.findById(secretariatId);
        if (!secretariat) {
            throw new NotFoundException(`Segretario con secretariatId ${secretariatId} non trovato`);
        }
        try {
            await this.usersService.removeUser(secretariat.user.id);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDatabaseError(error, "Errore durante l'eliminazione del segretario");
        }
    }
}
