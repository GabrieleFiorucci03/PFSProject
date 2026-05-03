import { Test, TestingModule } from '@nestjs/testing';
import { DegreeCoursesService } from './degree-courses.service';

describe('DegreeCoursesService', () => {
  let service: DegreeCoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DegreeCoursesService],
    }).compile();

    service = module.get<DegreeCoursesService>(DegreeCoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
