import { Test, TestingModule } from '@nestjs/testing';
import { DegreeCoursesService } from './degree-courses.service';
import { DegreeCoursesRepository } from './degree-courses.repository';
import { TeachersRepository } from '../teachers/teachers.repository';

describe('DegreeCoursesService', () => {
  let service: DegreeCoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DegreeCoursesService,
        { provide: DegreeCoursesRepository, useValue: {} },
        { provide: TeachersRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<DegreeCoursesService>(DegreeCoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
