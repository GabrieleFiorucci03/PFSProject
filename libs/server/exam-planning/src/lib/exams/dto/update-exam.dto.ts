import { PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';

/** DTO di aggiornamento parziale di un appello d'esame (tutti i campi opzionali). */
export class UpdateExamDto extends PartialType(CreateExamDto) {}
