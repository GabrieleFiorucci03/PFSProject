import { Test, TestingModule } from '@nestjs/testing';
import { DegreeCoursesController } from './degree-courses.controller';
import { DegreeCoursesService } from './degree-courses.service';

describe('DegreeCoursesController', () => {
  let controller: DegreeCoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DegreeCoursesController],
      providers: [{ provide: DegreeCoursesService, useValue: {} }],
    }).compile();

    controller = module.get<DegreeCoursesController>(DegreeCoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
