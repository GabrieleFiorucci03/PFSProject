import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { ExamsRepository } from './exams.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { ExamSessionsRepository } from '../exam-sessions/exam-sessions.repository';
import { TeachersRepository } from '../teachers/teachers.repository';

describe('ExamsService', () => {
  let service: ExamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: ExamsRepository, useValue: {} },
        { provide: SubjectsRepository, useValue: {} },
        { provide: ExamSessionsRepository, useValue: {} },
        { provide: TeachersRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
