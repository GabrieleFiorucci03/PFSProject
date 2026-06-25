import { PartialType } from '@nestjs/swagger';
import { CreateDegreeCourseDto } from './create-degree-course.dto';

/** DTO di aggiornamento parziale di un corso di laurea (tutti i campi opzionali). */
export class UpdateDegreeCourseDto extends PartialType(CreateDegreeCourseDto) {}
