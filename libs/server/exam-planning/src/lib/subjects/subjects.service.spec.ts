import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { SubjectsRepository } from './subjects.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { DegreeCoursesRepository } from '../degree-courses/degree-courses.repository';
import { ExamsRepository } from '../exams/exams.repository';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let repository: { deleteOne: jest.Mock };
  let examsRepository: { countBySubject: jest.Mock };

  beforeEach(async () => {
    repository = { deleteOne: jest.fn() };
    examsRepository = { countBySubject: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: SubjectsRepository, useValue: repository },
        { provide: TeachersRepository, useValue: {} },
        { provide: DegreeCoursesRepository, useValue: {} },
        { provide: ExamsRepository, useValue: examsRepository },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOne', () => {
    it('rifiuta con 409 se l\'insegnamento ha appelli collegati, senza eliminare', async () => {
      examsRepository.countBySubject.mockResolvedValue(1);

      await expect(service.deleteOne(1)).rejects.toBeInstanceOf(ConflictException);
      expect(repository.deleteOne).not.toHaveBeenCalled();
    });

    it('elimina l\'insegnamento quando non ci sono appelli collegati', async () => {
      examsRepository.countBySubject.mockResolvedValue(0);
      repository.deleteOne.mockResolvedValue(true);

      await expect(service.deleteOne(1)).resolves.toBeUndefined();
      expect(repository.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
