import { PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';

/** DTO di aggiornamento parziale di un docente (tutti i campi opzionali). */
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
