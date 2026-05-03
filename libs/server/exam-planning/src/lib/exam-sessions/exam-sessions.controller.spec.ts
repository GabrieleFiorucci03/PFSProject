import { Test, TestingModule } from '@nestjs/testing';
import { ExamSessionsController } from './exam-sessions.controller';

describe('ExamSessionsController', () => {
  let controller: ExamSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamSessionsController],
    }).compile();

    controller = module.get<ExamSessionsController>(ExamSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
