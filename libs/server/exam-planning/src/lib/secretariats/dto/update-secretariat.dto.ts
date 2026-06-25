import { PartialType } from '@nestjs/swagger';
import { CreateSecretariatDto } from './create-secretariat.dto';

/** DTO di aggiornamento parziale di un segretario (tutti i campi opzionali). */
export class UpdateSecretariatDto extends PartialType(CreateSecretariatDto) {}
