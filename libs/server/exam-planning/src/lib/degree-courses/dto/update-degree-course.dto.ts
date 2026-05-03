import { PartialType } from '@nestjs/swagger';
import { CreateDegreeCourseDto } from './create-degree-course.dto';

export class UpdateDegreeCourseDto extends PartialType(CreateDegreeCourseDto) {}
