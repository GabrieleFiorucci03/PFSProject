import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsRepository } from './exam-sessions.repository';
import { ExamsRepository } from '../exams/exams.repository';

describe('ExamSessionsService', () => {
  let service: ExamSessionsService;
  let repository: { deleteOne: jest.Mock; findAll: jest.Mock; createOne: jest.Mock };
  let examsRepository: { countByExamSession: jest.Mock };

  beforeEach(async () => {
    repository = { deleteOne: jest.fn(), findAll: jest.fn(), createOne: jest.fn() };
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

  describe('createOne - sovrapposizione periodi', () => {
    const dto = {
      name: 'Nuova Sessione',
      startDate: '2026-11-02',
      endDate: '2026-11-20',
      planningStartDate: '2026-10-01',
      planningEndDate: '2026-10-20',
    };

    it('rifiuta con 409 se il periodo-sessione si sovrappone a un altro', async () => {
      repository.findAll.mockResolvedValue([
        {
          examSessionId: 9,
          name: 'Esistente',
          startDate: '2026-11-10',
          endDate: '2026-11-25', // si sovrappone a [11-02, 11-20]
          planningStartDate: '2026-09-01',
          planningEndDate: '2026-09-20',
        },
      ]);

      await expect(service.createOne({ ...dto })).rejects.toBeInstanceOf(ConflictException);
      expect(repository.createOne).not.toHaveBeenCalled();
    });

    it('consente la creazione se solo le finestre di pianificazione si sovrappongono', async () => {
      repository.findAll.mockResolvedValue([
        {
          examSessionId: 9,
          name: 'Esistente',
          startDate: '2026-12-01',
          endDate: '2026-12-20', // periodo NON sovrapposto
          planningStartDate: '2026-10-05',
          planningEndDate: '2026-10-15', // pianificazione sovrapposta: ammessa
        },
      ]);
      repository.createOne.mockResolvedValue({
        examSessionId: 1,
        ...dto,
      });

      await expect(service.createOne({ ...dto })).resolves.toMatchObject({ id: 1 });
      expect(repository.createOne).toHaveBeenCalled();
    });
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
