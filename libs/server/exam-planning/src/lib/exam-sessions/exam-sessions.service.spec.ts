import { Test, TestingModule } from '@nestjs/testing';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsRepository } from './exam-sessions.repository';

describe('ExamSessionsService', () => {
  let service: ExamSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamSessionsService,
        { provide: ExamSessionsRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<ExamSessionsService>(ExamSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
