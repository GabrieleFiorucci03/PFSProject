import { Test, TestingModule } from '@nestjs/testing';
import { ExamSessionsController } from './exam-sessions.controller';
import { ExamSessionsService } from './exam-sessions.service';

describe('ExamSessionsController', () => {
  let controller: ExamSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamSessionsController],
      providers: [{ provide: ExamSessionsService, useValue: {} }],
    }).compile();

    controller = module.get<ExamSessionsController>(ExamSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
