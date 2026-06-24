import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsRepository } from './exam-sessions.repository';
import { ExamsRepository } from '../exams/exams.repository';

describe('ExamSessionsService', () => {
  let service: ExamSessionsService;
  let repository: { deleteOne: jest.Mock };
  let examsRepository: { countByExamSession: jest.Mock };

  beforeEach(async () => {
    repository = { deleteOne: jest.fn() };
    examsRepository = { countByExamSession: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamSessionsService,
        { provide: ExamSessionsRepository, useValue: repository },
        { provide: ExamsRepository, useValue: examsRepository },
      ],
    }).compile();

    service = module.get<ExamSessionsService>(ExamSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOne', () => {
    it('rifiuta con 409 se la sessione ha appelli collegati, senza eliminare', async () => {
      examsRepository.countByExamSession.mockResolvedValue(3);

      await expect(service.deleteOne(1)).rejects.toBeInstanceOf(ConflictException);
      expect(repository.deleteOne).not.toHaveBeenCalled();
    });

    it('elimina la sessione quando non ci sono appelli collegati', async () => {
      examsRepository.countByExamSession.mockResolvedValue(0);
      repository.deleteOne.mockResolvedValue(true);

      await expect(service.deleteOne(1)).resolves.toBeUndefined();
      expect(repository.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
