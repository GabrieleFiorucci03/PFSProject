import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerExamPlanningModule } from '@server/exam-planning';

/**
 * Modulo radice dell'API. Compone i moduli di dominio: database, utenti,
 * autenticazione e pianificazione appelli.
 */
@Module({
  imports: [ServerUsersModule, DatabaseModule, ServerAuthModule, ServerExamPlanningModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
