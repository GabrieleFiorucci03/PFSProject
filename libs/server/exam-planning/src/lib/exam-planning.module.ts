import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerUsersModule } from '@server/users';
import { DegreeCoursesController } from './degree-courses/degree-courses.controller';
import { DegreeCoursesService } from './degree-courses/degree-courses.service';
import { SubjectsController } from './subjects/subjects.controller';
import { ExamSessionsService } from './exam-sessions/exam-sessions.service';
import { SubjectsService } from './subjects/subjects.service';
import { ExamSessionsController } from './exam-sessions/exam-sessions.controller';
import { ExamsController } from './exams/exams.controller';
import { ExamsService } from './exams/exams.service';
import { TeachersController } from './teachers/teachers.controller';
import { TeachersService } from './teachers/teachers.service';
import { SecretariatsController } from './secretariats/secretariats.controller';
import { SecretariatsService } from './secretariats/secretariats.service';
import { DegreeCourseEntity } from './degree-courses/degree-course.entity';
import { SubjectEntity } from './subjects/subject.entity';
import { ExamSessionEntity } from './exam-sessions/exam-sessions.entity';
import { ExamEntity } from './exams/exam.entity';
import { TeacherEntity } from './teachers/teacher.entity';
import { SecretariatEntity } from './secretariats/secretariat.entity';
import { DegreeCoursesRepository } from './degree-courses/degree-courses.repository';
import { ExamSessionsRepository } from './exam-sessions/exam-sessions.repository';
import { TeachersRepository } from './teachers/teachers.repository';
import { SecretariatsRepository } from './secretariats/secretariats.repository';
import { SubjectsRepository } from './subjects/subjects.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DegreeCourseEntity,
      SubjectEntity,
      ExamSessionEntity,
      ExamEntity,
      TeacherEntity,
      SecretariatEntity,
    ]),
    ServerUsersModule,
  ],
  controllers: [
    DegreeCoursesController,
    SubjectsController,
    ExamSessionsController,
    ExamsController,
    TeachersController,
    SecretariatsController,
  ],
  providers: [
    DegreeCoursesService,
    ExamSessionsService,
    SubjectsService,
    ExamsService,
    TeachersService,
    SecretariatsService,
    DegreeCoursesRepository,
    ExamSessionsRepository,
    TeachersRepository,
    SecretariatsRepository,
    SubjectsRepository,
  ],
  exports: [],
})
export class ServerExamPlanningModule {}
