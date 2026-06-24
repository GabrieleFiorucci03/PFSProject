import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DegreeCoursesService } from './degree-courses.service';
import { DegreeCoursesRepository } from './degree-courses.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';

describe('DegreeCoursesService', () => {
  let service: DegreeCoursesService;
  let degreeCoursesRepository: { deleteOne: jest.Mock };
  let subjectsRepository: { countByDegreeCourse: jest.Mock };

  beforeEach(async () => {
    degreeCoursesRepository = { deleteOne: jest.fn() };
    subjectsRepository = { countByDegreeCourse: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DegreeCoursesService,
        { provide: DegreeCoursesRepository, useValue: degreeCoursesRepository },
        { provide: TeachersRepository, useValue: {} },
        { provide: SubjectsRepository, useValue: subjectsRepository },
      ],
    }).compile();

    service = module.get<DegreeCoursesService>(DegreeCoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOne', () => {
    it('rifiuta con 409 se il corso ha insegnamenti collegati, senza eliminare', async () => {
      subjectsRepository.countByDegreeCourse.mockResolvedValue(2);

      await expect(service.deleteOne(1)).rejects.toBeInstanceOf(ConflictException);
      expect(degreeCoursesRepository.deleteOne).not.toHaveBeenCalled();
    });

    it('elimina il corso quando non ci sono insegnamenti collegati', async () => {
      subjectsRepository.countByDegreeCourse.mockResolvedValue(0);
      degreeCoursesRepository.deleteOne.mockResolvedValue(true);

      await expect(service.deleteOne(1)).resolves.toBeUndefined();
      expect(degreeCoursesRepository.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
