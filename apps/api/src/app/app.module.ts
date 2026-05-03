import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerExamPlanningModule } from '@server/exam-planning';

@Module({
  imports: [ServerUsersModule, DatabaseModule, ServerAuthModule, ServerExamPlanningModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
