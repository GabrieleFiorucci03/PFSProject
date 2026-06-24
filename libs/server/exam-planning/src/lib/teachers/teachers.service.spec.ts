import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServerUsersService } from '@server/users';
import { UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { TeachersService } from './teachers.service';
import { TeachersRepository } from './teachers.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { ExamsRepository } from '../exams/exams.repository';

describe('TeachersService', () => {
  let service: TeachersService;
  let repository: { findById: jest.Mock };
  let usersService: { removeUser: jest.Mock };
  let subjectsRepository: { countByTeacher: jest.Mock };
  let examsRepository: { countByTeacher: jest.Mock };

  const segreteria: AuthenticatedUser = {
    id: 99,
    name: 'Seg',
    email: 'seg@unibs.it',
    role: UserRole.SEGRETERIA,
  };

  beforeEach(async () => {
    repository = { findById: jest.fn() };
    usersService = { removeUser: jest.fn() };
    subjectsRepository = { countByTeacher: jest.fn() };
    examsRepository = { countByTeacher: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: TeachersRepository, useValue: repository },
        { provide: ServerUsersService, useValue: usersService },
        { provide: SubjectsRepository, useValue: subjectsRepository },
        { provide: ExamsRepository, useValue: examsRepository },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOne', () => {
    it('rifiuta con 409 se il docente ha insegnamenti/appelli collegati, senza eliminare', async () => {
      repository.findById.mockResolvedValue({ teacherId: 1, user: { id: 10 } });
      subjectsRepository.countByTeacher.mockResolvedValue(2);
      examsRepository.countByTeacher.mockResolvedValue(1);

      await expect(service.deleteOne(1, segreteria)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersService.removeUser).not.toHaveBeenCalled();
    });

    it('elimina il docente quando non ha elementi collegati', async () => {
      repository.findById.mockResolvedValue({ teacherId: 1, user: { id: 10 } });
      subjectsRepository.countByTeacher.mockResolvedValue(0);
      examsRepository.countByTeacher.mockResolvedValue(0);
      usersService.removeUser.mockResolvedValue(undefined);

      await expect(service.deleteOne(1, segreteria)).resolves.toBeUndefined();
      expect(usersService.removeUser).toHaveBeenCalledWith(10);
    });
  });
});
