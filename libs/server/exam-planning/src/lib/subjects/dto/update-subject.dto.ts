import { PartialType } from '@nestjs/swagger';
import { CreateSubjectDto } from './create-subject.dto';

/** DTO di aggiornamento parziale di un insegnamento (tutti i campi opzionali). */
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
