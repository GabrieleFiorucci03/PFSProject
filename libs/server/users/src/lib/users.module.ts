import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { ServerUsersController } from './users.controller';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';

/**
 * Modulo utenti: registra l'entità `UserEntity`, il controller e service CRUD e
 * il repository custom. Esporta `ServerUsersService` perché il modulo di auth
 * (e indirettamente i profili docente/segretario) possa creare/leggere utenti.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [ServerUsersController],
  providers: [
    ServerUsersService,
    UsersRepository
  ],
  exports: [ServerUsersService]
})
export class ServerUsersModule {}

