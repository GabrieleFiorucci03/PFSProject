import { Test, TestingModule } from '@nestjs/testing';
import { ServerUsersService } from '@server/users';
import { TeachersService } from './teachers.service';
import { TeachersRepository } from './teachers.repository';

describe('TeachersService', () => {
  let service: TeachersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: TeachersRepository, useValue: {} },
        { provide: ServerUsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
