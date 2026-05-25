import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from '@server/security';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerUsersService {

    // Injecting the repository
    constructor(private readonly usersRepository: UsersRepository){}

    async findByEmail(email: string): Promise<UserEntity | null> {
        // Ritorna null se non trovato: il chiamante (auth validateUser) decide la
        // risposta. Evita di distinguere "email inesistente" (404) da "password
        // errata" (401), che permetterebbe user enumeration.
        return this.usersRepository.findByEmail(email);
    }

    async getOneUser(id: number): Promise<UserEntity> {
        const user = await this.usersRepository.findById(id);

        if(!user) throw new NotFoundException(`User with id ${id} not found`);

        return user;
    }

    async getUsers(role?: UserRole): Promise<UserEntity[]> {
        // Lista vuota -> 200 con []: un filtro senza risultati non e' un errore.
        return this.usersRepository.findAll(role);
    }

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const existing = dto.email
            ? await this.usersRepository.findByEmail(dto.email)
            : null;

        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password,10);
        return this.usersRepository.createOne(dto,passwordHash);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        if (dto.email) {
            const existing = await this.usersRepository.findByEmail(dto.email);
            if (existing && existing.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        try {
            const updated = await this.usersRepository.updateOne(id, dto);
            if (!updated) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            // pg unique_violation: email duplicata in una race concorrente
            // (il pre-check sopra non copre due update simultanei).
            if ((error as { code?: string })?.code === '23505') {
                throw new ConflictException('Email already in use');
            }
            throw error;
        }
    }

    async removeUser(id: number): Promise<void> {
        const deleted = await this.usersRepository.deleteOne(id);
        if (!deleted) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
